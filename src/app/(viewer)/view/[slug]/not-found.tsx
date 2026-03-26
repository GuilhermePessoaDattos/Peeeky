export default function ViewerNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Not Found</h1>
        <p className="mt-2 text-gray-500">
          This link is invalid or the document is no longer available.
        </p>
      </div>
    </div>
  );
}
