export default function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-blue-500 bg-blue-100 text-blue-900 px-4 py-3 my-6 rounded">
      {children}
    </div>
  );
}
