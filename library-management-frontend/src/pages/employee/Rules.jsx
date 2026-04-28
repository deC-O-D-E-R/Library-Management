import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';

const Rules = () => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/rules-and-regulations.pdf';
        link.download = 'Rules_and_Regulations.pdf';
        link.click();
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