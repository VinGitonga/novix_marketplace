import { FC, ReactNode } from "react";
import RootLayout from "./RootLayout";

type AppLayoutWrapperProps = {
	children: ReactNode;
};

const AppLayoutWrapper: FC<AppLayoutWrapperProps> = ({ children }) => {
	return <RootLayout>{children}</RootLayout>;
};

export default AppLayoutWrapper;
