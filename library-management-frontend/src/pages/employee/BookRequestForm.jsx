import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { downloadBookRequestPdf } from '../../api/userApi';

const BookRequestForm = () => {

    const handleDownload = async () => {
        try {
            const response = await downloadBookRequestPdf();

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Book_Request_Form.pdf');

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading book request PDF:', error);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-text-primary text-2xl font-bold">Book Request Form</h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Download the form, fill it out and submit it at the library counter
                    </p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-3 max-w-md">
                    <p className="text-text-primary text-sm font-medium">Book Acquisition Request Form</p>
                    <p className="text-text-secondary text-xs">
                        Use this form to request books that are not currently available in the library collection.
                        Fill it out and hand it to the librarian at the counter.
                    </p>
                    <Button onClick={handleDownload} className="w-fit">
                        Download Form
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

export default BookRequestForm;