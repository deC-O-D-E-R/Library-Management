import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';

const BookRequestForm = () => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/book-request-form.pdf';
        link.download = 'Book_Request_Form.pdf';
        link.click();
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