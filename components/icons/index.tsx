"use client";

/**
 * TummyTime's icon system — Streamline (streamlinehq.com), consumed via
 * Iconify (@iconify/react + @iconify-json/streamline) rather than a raw
 * SVG sprite, so every icon is addressed by name against the full local
 * collection (offline — no runtime calls to an icon CDN).
 *
 * Every export here matches the name of the lucide-react icon it replaced,
 * so call sites across the app (`<Star size={14} className="..." />`)
 * didn't need to change — only the import source did. `size` is Lucide's
 * prop name; Iconify uses `width`/`height`, translated below.
 */

import { Icon as IconifyIcon, addCollection } from "@iconify/react";
import type { ComponentPropsWithoutRef } from "react";
import streamlineIcons from "@iconify-json/streamline/icons.json";
import type { IconifyJSON } from "@iconify/types";

addCollection(streamlineIcons as IconifyJSON);

type IconifyProps = ComponentPropsWithoutRef<typeof IconifyIcon>;

export interface IconProps extends Omit<IconifyProps, "icon" | "width" | "height"> {
  size?: number | string;
}

export type IconComponent = (props: IconProps) => ReturnType<typeof IconifyIcon>;

function streamline(name: string): IconComponent {
  function StreamlineIcon({ size = 24, ...props }: IconProps) {
    return <IconifyIcon icon={`streamline:${name}`} width={size} height={size} {...props} />;
  }
  StreamlineIcon.displayName = `StreamlineIcon(${name})`;
  return StreamlineIcon;
}

/* ── Direct replacements for every lucide-react icon used in the app ── */
export const AlertCircle = streamline("interface-alert-warning-circle-warning-alert-frame-exclamation-caution-circle");
export const AlertTriangle = streamline("interface-alert-warning-triangle-frame-alert-warning-triangle-exclamation-caution");
export const ArrowDownLeft = streamline("interface-arrows-downleft-corner-arrow-corner-down-left-downleft");
export const ArrowLeft = streamline("arrow-round-left");
export const ArrowRight = streamline("arrow-round-right");
export const ArrowUpRight = streamline("interface-arrows-upright-corner-arrow-up-right-upright-corner");
export const Bell = streamline("interface-alert-alarm-bell-1-notification-vibrate-ring-sound-alarm-alert-bell-noise");
export const Bike = streamline("bicycle-bike");
export const CalendarDays = streamline("blank-calendar");
export const Car = streamline("car-taxi-1");
export const Check = streamline("check");
export const CheckCircle2 = streamline("interface-validation-check-circle-checkmark-addition-circle-success-check-validation-add-form");
export const ClipboardList = streamline("interface-file-clipboard-text-edition-form-task-checklist-edit-clipboard");
export const Clock = streamline("interface-time-clock-circle-clock-loading-measure-time-circle");
export const Copy = streamline("interface-edit-copy-clipboard-copy-cut-paste");
export const CreditCard = streamline("credit-card-1");
export const Cash = streamline("money-cash-bill-1-billing-bills-payment-finance-cash-currency-money-accounting");
export const History = streamline("medical-files-report-history");
export const Info = streamline("information-circle");
export const LayoutDashboard = streamline("dashboard-3");
export const LifeBuoy = streamline("travel-wayfinder-lifebuoy-water-life-ring-wheely-lifebelt-kisbee");
export const ListChecks = streamline("interface-file-clipboard-check-checkmark-edit-task-edition-checklist-check-success-clipboard-form");
export const LocateFixed = streamline("target");
export const LogOut = streamline("logout-1");
export const MailCheck = streamline("mail-send-envelope");
export const Menu = streamline("interface-setting-menu-1-button-parallel-horizontal-lines-menu-navigation-three-hamburger");
export const Minus = streamline("interface-file-remove-file-common-remove-minus-subtract");
export const Navigation = streamline("compass-navigator");
export const Package = streamline("shipping-box-1-box-package-label-delivery-shipment-shipping");
export const PackageSearch = streamline("shipping-box-1-box-package-label-delivery-shipment-shipping");
export const Paperclip = streamline("paperclip-1");
export const Pencil = streamline("pencil");
export const Phone = streamline("phone-telephone-android-phone-mobile-device-smartphone-iphone");
export const Plus = streamline("add-1");
export const Power = streamline("button-power-1");
export const RefreshCw = streamline("arrow-reload-horizontal-1");
export const Search = streamline("magnifying-glass");
export const Send = streamline("mail-send-email-send-email-paper-airplane");
export const ShieldAlert = streamline("interface-security-shield-1-shield-protection-security-defend-crime-war-cover");
export const Star = streamline("desktop-favorite-star");
export const StarSolid = streamline("desktop-favorite-star-solid");
export const Store = streamline("store-1");
export const Tag = streamline("tag");
export const Trash2 = streamline("interface-delete-bin-1-remove-delete-empty-bin-trash-garbage");
export const TrendingUp = streamline("trending-content");
export const Users = streamline("interface-user-multiple-close-geometric-human-multiple-person-up-user");
export const UtensilsCrossed = streamline("food-kitchenware-fork-spoon-fork-spoon-food-dine-cook-utensils-eat-restaurant-dining");
export const Wallet = streamline("wallet");
export const WifiOff = streamline("wifi");
export const X = streamline("delete-1");
export const XCircle = streamline("interface-delete-3-remove-circle-garbage-trash-delete");

/* ── Additional icons — replace raw emoji throughout the app ── */
export const MapPin = streamline("location-pin-3");
export const ShoppingCart = streamline("shopping-cart-1");
export const Leaf = streamline("leaf");
export const Heart = streamline("heart");
export const HeartSolid = streamline("heart-solid");
export const Flame = streamline("interface-content-fire-lit-flame-torch-trending");
export const SadFace = streamline("sad-face");
export const Bank = streamline("bank");
export const Lock = streamline("interface-lock-combination-combo-lock-locked-padlock-secure-security-shield-keyhole");
export const PartyPopper = streamline("entertainment-party-popper-hobby-entertainment-party-popper-confetti-event");
export const Zap = streamline("flash-1");
export const Pizza = streamline("food-pizza-drink-cook-fast-cooking-nutrition-pizza-food");
export const Burger = streamline("burger");
export const Drumstick = streamline("food-drum-stick-1-cook-animal-drumsticks-products-chicken-cooking-nutrition-food");
export const CupSoda = streamline("water-glass");
export const Soup = streamline("food-kitchenware-bowl-chop-stick-cook-soup-bowl-chopsticks-cooking-nutrition-asian-food");
export const RiceBowl = streamline("food-kitchenware-spoon-plate-fork-plate-food-dine-cook-utensils-eat-restaurant-dining");
export const Dessert = streamline("cake-slice");
export const Share = streamline("share-link");
export const EyeOff = streamline("invisible-1");
export const Picture = streamline("image-picture-landscape-1-photos-photo-landscape-picture-photography-camera-pictures");
export const Log = streamline("log");
export const UserCircle = streamline("interface-user-circle-circle-geometric-human-person-single-user");
export const Cherries = streamline("cherries");
export const Bag = streamline("bag");
