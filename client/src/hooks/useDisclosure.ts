import { useState } from "react";

export interface UseDisclosureProps {
	isOpen?: boolean;
	defaultOpen?: boolean;
	onClose?(): void;
	onOpen?(): void;
}

const useDisclosure = (props: UseDisclosureProps = {}) => {
	const { defaultOpen, isOpen: isOpenProp, onClose: onCloseProp, onOpen: onOpenProp } = props;

	const [isOpen, setIsOpen] = useState<boolean>(isOpenProp ?? defaultOpen ?? false);

	const isControlled = isOpenProp !== undefined;

	const onClose = () => {
		if (!isControlled) {
			setIsOpen(false);
		}
		onCloseProp && onCloseProp?.();
	};

	const onOpen = () => {
		if (!isControlled) {
			setIsOpen(true);
		}
		onOpenProp && onOpenProp?.();
	};

	const onOpenChange = () => {
		const action = isOpen ? onClose : onOpen;

		action();
	};

	return { isOpen, onOpen, onClose, onOpenChange, isControlled };
};

export default useDisclosure;
