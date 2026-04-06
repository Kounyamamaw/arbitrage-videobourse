export type InfoItem = {
  title: string;
  description: string;
  links?: { title: string; href: string }[];
};

export type InfoSection = {
  title: string;
  items: InfoItem[];
};

export type InfoConfig = {
  title: string;
  sections: InfoSection[];
};

export const infoConfigs: Record<string, InfoConfig> = {};
