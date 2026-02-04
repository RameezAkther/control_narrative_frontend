import React from "react";
import { FileText, Trash2 } from "lucide-react";
import ProcessingStatus from "./ProcessingStatus";

export default function DocumentList({
	documents,
	progressMap,
	onDelete,
	page,
	totalPages,
	setPage,
}) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="p-6 border-b border-gray-100 bg-gray-50/50">
				<h2 className="text-lg font-semibold text-gray-800">
					Your Documents
				</h2>
			</div>

			{documents.length === 0 ? (
				<div className="p-12 text-center flex flex-col items-center text-gray-500">
					<FileText size={48} className="text-gray-300 mb-4" />
					<h3 className="text-gray-900 font-medium">
						No documents yet
					</h3>
					<p className="text-sm mt-1">
						Uploaded files will appear here.
					</p>
				</div>
			) : (
				<ul className="divide-y divide-gray-100">
					{documents.map((doc) => {
						const info = progressMap[doc._id] || {};
						// If info is empty but parsing is done, we might want to fallback to doc.status
						// However, ProcessingStatus handles empty/defaults gracefully, we just need to pass what we have.

						// Prefer live progress info, fallback to doc properties
						const displayStatus = info.status || doc.status;
						// The API returns stage in info, but if missing (initially), default to 0
						const displayStage =
							info.stage ||
							(displayStatus === "completed"
								? info.total || 16
								: 0);

						return (
							<li
								key={doc._id}
								className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 group"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-600">
											<FileText size={20} />
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-900 truncate pr-4">
												{doc.filename}
											</p>
											<p className="text-xs text-gray-500">
												ID: {doc._id}
											</p>
										</div>
									</div>

									{/* Status Section - Full Width below title/icon on mobile, or inline? 
                      User requested "Status that shows up in the bottom of the uploaded document"
                      So passing it below is correct.
                  */}
									<div className="mt-1">
										<ProcessingStatus
											status={displayStatus}
											stage={displayStage}
											totalStages={info.total || 16}
											message={info.message}
											percent={info.percent}
										/>
									</div>
								</div>

								<div className="flex items-start justify-end">
									<button
										onClick={() => onDelete(doc._id)}
										className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
										title="Delete Document"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{/* Pagination */}
			{documents.length > 0 && (
				<div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
					<span className="text-sm text-gray-500">
						Page {page} of {totalPages}
					</span>
					<div className="flex gap-2">
						<button
							disabled={page === 1}
							onClick={() => setPage(page - 1)}
							className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition"
						>
							Previous
						</button>
						<button
							disabled={page === totalPages}
							onClick={() => setPage(page + 1)}
							className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
