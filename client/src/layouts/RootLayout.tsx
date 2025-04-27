import { FC, ReactNode } from "react";

type RootLayoutProps = {
	children: ReactNode;
};

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
	return <div className="min-h-screen antialiased transition-colors ease-in-out duration-200">{children}</div>;
};

export default RootLayout;
