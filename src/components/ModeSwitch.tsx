import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";

const ModeSwitch = () => {
	const { setTheme, theme } = useTheme();
	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};
	return (
		<div className="flex justify-between items-center w-full">
			<div>Dark Mode</div>
			<Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
		</div>
	);
};

export default ModeSwitch;
