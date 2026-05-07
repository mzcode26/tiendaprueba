interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <div className="mb-8 flex flex-col gap-2">
    <h2 className="text-3xl font-semibold text-white">{title}</h2>
    {subtitle ? <p className="text-slate-400">{subtitle}</p> : null}
  </div>
);

export default PageHeader;
