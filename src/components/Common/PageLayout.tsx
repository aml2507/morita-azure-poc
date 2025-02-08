interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF00FF] to-[#7C4DFF] [text-shadow:0_0_30px_rgba(255,0,255,0.3)]">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-white/70 mb-8">{description}</p>
          )}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout; 