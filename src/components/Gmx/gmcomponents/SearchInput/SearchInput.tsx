//import searchIcon from "img/search.svg";
import { useMedia } from "react-use";

type Props = {
  value: string;
  setValue: (e: any) => void;
  onKeyDown: (e: any) => void;
  className?: string;
  placeholder?: string;
};

export default function SearchInput({ value, setValue, onKeyDown, className, placeholder }: Props) {
  const isSmallerScreen = useMedia("(max-width: 700px)");
  return (
    <div>
      <input
        type="text"
        placeholder={placeholder ?? `Search Token`}
        value={value}
        onChange={setValue}
        onKeyDown={onKeyDown}
        autoFocus={!isSmallerScreen}
        className="Tokenselector-search-input"
        style={{
          //backgroundImage: `url(${searchIcon})`,
        }}
      />
    </div>
  );
}
