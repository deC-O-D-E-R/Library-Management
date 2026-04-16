const Table = ({ columns, data, emptyMessage = 'No data found' }) => {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-sidebar border-b border-border">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className="text-accent text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center text-text-secondary py-10"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-border hover:bg-sidebar transition-colors duration-150"
                            >
                                {columns.map((col, j) => (
                                    <td key={j} className="px-4 py-3 text-text-primary">
                                        {col.render ? col.render(row, i) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;