import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { downloadRulesPdf } from '../../api/userApi';

const Rules = () => {

    const handleDownload = async () => {
        try {
            const response = await downloadRulesPdf();

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Rules_and_Regulations.pdf');

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading rules PDF:', error);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Library Rules & Regulations</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Download the rules document and follow the library guidelines
                    </p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-3 max-w-md">
                    <p className="text-text-primary text-sm font-medium">Rules & Regulations Document</p>
                    <p className="text-text-secondary text-xs">
                        This document contains all the library rules, regulations, and usage guidelines.
                        Please read it carefully before using library services.
                    </p>
                    <Button onClick={handleDownload} className="w-fit">
                        Download Rules
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default Rules;