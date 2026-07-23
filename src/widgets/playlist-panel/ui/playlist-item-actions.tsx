import { Pressable, View } from "react-native";
import { Defs, G, Path, ClipPath, Rect, Svg } from "react-native-svg";

type PlaylistItemActionsProps = {
  playlistTitle: string;
  onDelete: () => void;
  onEdit: () => void;
};

export function PlaylistItemActions({
  playlistTitle,
  onDelete,
  onEdit,
}: PlaylistItemActionsProps) {
  return (
    <View className="ml-auto flex-col gap-5 pr-2 pt-2">
      <Pressable
        accessibilityLabel={`Delete ${playlistTitle}`}
        className="h-9 w-9 items-center justify-center"
        onPress={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Svg fill="none" height="20" viewBox="0 0 20 20" width="20">
          <G clipPath="url(#delete-clip)">
            <Path
              clipRule="evenodd"
              d="M19.5074 1.90641C19.6949 1.71887 19.8003 1.4645 19.8003 1.19927C19.8003 0.93404 19.6949 0.679673 19.5074 0.492127C19.3198 0.304581 19.0655 0.199219 18.8002 0.199219C18.535 0.199219 18.2807 0.304581 18.0931 0.492127L10.0002 8.58498L1.90739 0.492127C1.71984 0.304581 1.46548 0.199219 1.20025 0.199219C0.935016 0.199219 0.680649 0.304581 0.493103 0.492127C0.305558 0.679673 0.200195 0.93404 0.200195 1.19927C0.200195 1.4645 0.305558 1.71887 0.493103 1.90641L8.58596 9.99927L0.493103 18.0921C0.305558 18.2797 0.200195 18.534 0.200195 18.7993C0.200195 19.0645 0.305558 19.3189 0.493103 19.5064C0.680649 19.694 0.935016 19.7993 1.20025 19.7993C1.46548 19.7993 1.71984 19.694 1.90739 19.5064L10.0002 11.4136L18.0931 19.5064C18.2807 19.694 18.535 19.7993 18.8002 19.7993C19.0655 19.7993 19.3198 19.694 19.5074 19.5064C19.6949 19.3189 19.8003 19.0645 19.8003 18.7993C19.8003 18.534 19.6949 18.2797 19.5074 18.0921L11.4145 9.99927L19.5074 1.90641Z"
              fill="#FFFEE9"
              fillRule="evenodd"
            />
          </G>
          <Defs>
            <ClipPath id="delete-clip">
              <Rect fill="white" height="20" width="20" />
            </ClipPath>
          </Defs>
        </Svg>
      </Pressable>

      <Pressable
        accessibilityLabel={`Edit ${playlistTitle}`}
        className="h-9 w-9 items-center justify-center"
        onPress={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        <Svg fill="none" height="20" viewBox="0 0 20 20" width="20">
          <G clipPath="url(#edit-clip)">
            <Path
              d="M3.49802 18.0643L6.23219 17.1526C6.87802 16.9376 7.20052 16.8301 7.50386 16.6859C7.86177 16.5149 8.20013 16.3056 8.51302 16.0618C8.77802 15.8551 9.01886 15.6143 9.49969 15.1334L16.6005 8.03343L17.373 7.26093C17.9876 6.6464 18.3328 5.81292 18.3328 4.94384C18.3328 4.07477 17.9876 3.24129 17.373 2.62676C16.7585 2.01223 15.925 1.66699 15.0559 1.66699C14.1869 1.66699 13.3534 2.01223 12.7389 2.62676L11.9664 3.39926L4.86469 10.4993C4.38386 10.9809 4.14302 11.2218 3.93636 11.4868C3.69252 11.7997 3.48324 12.138 3.31219 12.4959C3.16802 12.7993 3.06052 13.1226 2.84552 13.7676L1.93386 16.5018M16.6005 8.03343C16.6005 8.03343 14.9597 7.93676 13.5114 6.48843C12.063 5.04093 11.9672 3.39926 11.9672 3.39926M3.49802 18.0643L2.82969 18.2876C2.6739 18.3398 2.50663 18.3476 2.34668 18.31C2.18673 18.2724 2.04044 18.1909 1.92425 18.0747C1.80806 17.9585 1.72659 17.8122 1.68898 17.6523C1.65137 17.4923 1.65912 17.3251 1.71136 17.1693L1.93469 16.5009L3.49802 18.0643Z"
              stroke="#FFFEE9"
              strokeWidth="1.5"
            />
          </G>
          <Defs>
            <ClipPath id="edit-clip">
              <Rect fill="white" height="20" width="20" />
            </ClipPath>
          </Defs>
        </Svg>
      </Pressable>
    </View>
  );
}
