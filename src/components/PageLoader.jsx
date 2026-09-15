// Lightweight inline spinner for page content areas. Unlike a full-screen
// blocking spinner, this renders within the page layout so the sidebar,
// header, and page container remain visible while data loads.
export default function PageLoader({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
    </div>
  );
}