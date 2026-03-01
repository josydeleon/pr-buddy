import clsx from "clsx";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  onTabChange: (id: string) => void;
  activeTab: string;
}

export const Tabs = ({ tabs, onTabChange, activeTab }: TabsProps) => {
  const handleTabClick = (id: string) => {
    onTabChange(id);
  };

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-4 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
