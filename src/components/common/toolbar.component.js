import React from "react";
import {
  OverflowMenu,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { BackIcon, MoreVerticalIcon } from "../assets/icons";

export const Toolbar = (props) => {
  const {
    menu,
    backIcon,
    menuIcon,
    onBackPress,
    ...topNavigationProps
  } = props;
  const [menuVisible, setMenuVisible] = React.useState(false);

  const onMenuSelect = () => {
    setMenuVisible(false);
  };

  const onMenuActionPress = () => {
    setMenuVisible(!menuVisible);
  };

  const renderMenuAnchorAction = () => (
    <TopNavigationAction
      icon={props.menuIcon || MoreVerticalIcon}
      onPress={onMenuActionPress}
    />
  );

  const renderMenuAction = () => (
    <OverflowMenu
      visible={menuVisible}
      anchor={renderMenuAnchorAction}
      placement="bottom end"
      onSelect={onMenuSelect}
      onBackdropPress={onMenuActionPress}
    >
      {menu()}
    </OverflowMenu>
  );

  const renderBackAction = () => (
    <TopNavigationAction
      icon={props.backIcon || BackIcon}
      onPress={onBackPress}
    />
  );

  return (
    <TopNavigation
      {...topNavigationProps}
      alignment="center"
      accessoryLeft={onBackPress && renderBackAction}
      accessoryRight={menu && renderMenuAction}
    />
  );
};
