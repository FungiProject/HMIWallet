import { ImSpinner2 } from "react-icons/im";

export default function SpinningLoaderGMX({ size = "1.25rem" }) {
    return (
        <ImSpinner2
            className="spin spinning-loader"
            style={{ fontSize: size }}
        />
    );
}
