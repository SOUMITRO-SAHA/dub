"use client";

import useDomain from "@/lib/swr/use-domain";
import useWorkspace from "@/lib/swr/use-workspace";
import {
  ArrowTurnRight2,
  Avatar,
  CopyButton,
  LinkLogo,
  Switch,
  Tooltip,
  TooltipContent,
  useInViewport,
} from "@dub/ui";
import {
  Apple,
  ArrowRight,
  Bolt,
  BoxArchive,
  Cards,
  CircleHalfDottedClock,
  EarthPosition,
  Incognito,
  InputPassword,
  Robot,
  SquareChart,
} from "@dub/ui/icons";
import {
  cn,
  formatDateTime,
  getApexDomain,
  getPrettyUrl,
  isDubDomain,
  linkConstructor,
  timeAgo,
} from "@dub/utils";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Mail } from "lucide-react";
import { memo, PropsWithChildren, useContext, useRef, useState } from "react";
import { useLinkBuilder } from "../modals/link-builder";
import { CommentsBadge } from "./comments-badge";
import { ResponseLink } from "./links-container";
import { LinksDisplayContext } from "./links-display-provider";

const quickViewSettings = [
  { label: "Conversion Tracking", icon: SquareChart, key: "trackConversion" },
  { label: "Custom Link Preview", icon: Cards, key: "proxy" },
  { label: "Link Cloaking", icon: Incognito, key: "rewrite" },
  { label: "Password Protection", icon: InputPassword, key: "password" },
  { label: "Link Expiration", icon: CircleHalfDottedClock, key: "expiresAt" },
  { label: "iOS Targeting", icon: Apple, key: "ios" },
  { label: "Android Targeting", icon: Robot, key: "android" },
  { label: "Geo Targeting", icon: EarthPosition, key: "geo" },
];

export function LinkTitleColumn({ link }: { link: ResponseLink }) {
  const { url, domain, key } = link;

  const { displayProperties } = useContext(LinksDisplayContext);

  const ref = useRef<HTMLDivElement>(null);

  const hasQuickViewSettings = quickViewSettings.some(({ key }) => link?.[key]);

  return (
    <div
      ref={ref}
      className="flex h-[32px] items-center gap-3 transition-[height] group-data-[variant=loose]/card-list:h-[60px]"
    >
      <div
        className={cn(
          "relative hidden shrink-0 items-center justify-center",
          displayProperties.includes("icon") && "sm:flex",
        )}
      >
        {/* Link logo background circle */}
        <div className="absolute inset-0 shrink-0 rounded-full border border-neutral-200 opacity-0 transition-opacity group-data-[variant=loose]/card-list:sm:opacity-100">
          <div className="h-full w-full rounded-full border border-white bg-gradient-to-t from-neutral-100" />
        </div>
        <div className="relative pr-0.5 transition-[padding] group-data-[variant=loose]/card-list:sm:p-2">
          {link.archived ? (
            <Tooltip content="Archived">
              <div>
                <BoxArchive className="size-4 shrink-0 p-0.5 text-neutral-600 transition-[width,height] sm:h-6 sm:w-6 group-data-[variant=loose]/card-list:sm:h-5 group-data-[variant=loose]/card-list:sm:w-5" />
              </div>
            </Tooltip>
          ) : (
            <LinkLogo
              apexDomain={getApexDomain(url)}
              className="size-4 shrink-0 transition-[width,height] sm:h-6 sm:w-6 group-data-[variant=loose]/card-list:sm:h-5 group-data-[variant=loose]/card-list:sm:w-5"
              imageProps={{
                loading: "lazy",
              }}
            />
          )}
        </div>
      </div>
      <div className="h-[24px] min-w-0 overflow-hidden transition-[height] group-data-[variant=loose]/card-list:h-[46px]">
        <div className="flex items-center gap-2">
          <div className="min-w-0 shrink grow-0 text-neutral-950">
            <div className="flex items-center gap-2">
              {displayProperties.includes("title") && link.title ? (
                <span
                  className={cn(
                    "truncate font-semibold leading-6 text-neutral-800",
                    link.archived && "text-neutral-600",
                  )}
                >
                  {link.title}
                </span>
              ) : (
                <UnverifiedTooltip domain={domain} _key={key}>
                  <a
                    href={linkConstructor({ domain, key })}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={linkConstructor({ domain, key, pretty: true })}
                    className={cn(
                      "truncate font-semibold leading-6 text-neutral-800 transition-colors hover:text-black",
                      link.archived && "text-neutral-600",
                    )}
                  >
                    {linkConstructor({ domain, key, pretty: true })}
                  </a>
                </UnverifiedTooltip>
              )}
              <CopyButton
                value={linkConstructor({
                  domain,
                  key,
                  pretty: false,
                })}
                variant="neutral"
                className="p-1.5"
              />
              {hasQuickViewSettings && <SettingsBadge link={link} />}
              {link.comments && <CommentsBadge comments={link.comments} />}
            </div>
          </div>
          <Details link={link} compact />
        </div>

        <Details link={link} />
      </div>
    </div>
  );
}

function UnverifiedTooltip({
  domain,
  _key,
  children,
}: PropsWithChildren<{ domain: string; _key: string }>) {
  const { slug } = useWorkspace();

  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInViewport(ref);

  const { verified } = useDomain({ slug: domain, enabled: isVisible });

  return (
    <div ref={ref}>
      {!isDubDomain(domain) && verified === false ? (
        <Tooltip
          content={
            <TooltipContent
              title="Your branded links won't work until you verify your domain."
              cta="Verify your domain"
              href={`/${slug}/settings/domains`}
            />
          }
        >
          <p className="cursor-default truncate font-semibold leading-6 text-neutral-500 line-through">
            {linkConstructor({ domain, key: _key, pretty: true })}
          </p>
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
}

function SettingsBadge({ link }: { link: ResponseLink }) {
  const settings = quickViewSettings.filter(({ key }) => link?.[key]);

  const { LinkBuilder, setShowLinkBuilder } = useLinkBuilder({
    props: link,
  });

  const [open, setOpen] = useState(false);

  return (
    <div className="hidden sm:block">
      <LinkBuilder />
      <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={100}>
        <HoverCard.Portal>
          <HoverCard.Content
            side="bottom"
            sideOffset={8}
            className="animate-slide-up-fade z-[99] items-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
          >
            <div className="flex w-[340px] flex-col p-3 text-sm">
              {settings.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setShowLinkBuilder(true);
                  }}
                  className="flex items-center justify-between gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-neutral-600" />
                    <span className="text-neutral-950">{label}</span>
                  </div>
                  <Switch checked />
                </button>
              ))}
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
        <HoverCard.Trigger asChild>
          <div className="rounded-full p-1.5 hover:bg-neutral-100">
            <Bolt className="size-3.5" />
          </div>
        </HoverCard.Trigger>
      </HoverCard.Root>
    </div>
  );
}

const Details = memo(
  ({ link, compact }: { link: ResponseLink; compact?: boolean }) => {
    const { url, createdAt } = link;

    const { displayProperties } = useContext(LinksDisplayContext);

    return (
      <div
        className={cn(
          "min-w-0 items-center whitespace-nowrap text-sm transition-[opacity,display] delay-[0s,150ms] duration-[150ms,0s]",
          compact
            ? [
                "hidden gap-2.5 opacity-0 group-data-[variant=compact]/card-list:flex group-data-[variant=compact]/card-list:opacity-100",
                "xs:min-w-[40px] xs:basis-[40px] min-w-0 shrink-0 grow basis-0 sm:min-w-[120px] sm:basis-[120px]",
              ]
            : "hidden gap-1.5 opacity-0 group-data-[variant=loose]/card-list:flex group-data-[variant=loose]/card-list:opacity-100 md:gap-3",
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          {displayProperties.includes("url") &&
            (compact ? (
              <ArrowRight className="mr-1 h-3 w-3 shrink-0 text-neutral-400" />
            ) : (
              <ArrowTurnRight2 className="h-3 w-3 shrink-0 text-neutral-400" />
            ))}
          {displayProperties.includes("url") ? (
            url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={url}
                className="truncate text-neutral-500 transition-colors hover:text-neutral-700 hover:underline hover:underline-offset-2"
              >
                {getPrettyUrl(url)}
              </a>
            ) : (
              <span className="truncate text-neutral-400">
                No URL configured
              </span>
            )
          ) : (
            <span className="truncate text-neutral-500">
              {link.description}
            </span>
          )}
        </div>
        <div
          className={cn(
            "hidden shrink-0",
            displayProperties.includes("user") && "sm:block",
          )}
        >
          <UserAvatar link={link} />
        </div>
        <div
          className={cn(
            "hidden shrink-0",
            displayProperties.includes("createdAt") && "sm:block",
          )}
        >
          <Tooltip content={formatDateTime(createdAt)} delayDuration={150}>
            <span className="text-neutral-400">{timeAgo(createdAt)}</span>
          </Tooltip>
        </div>
      </div>
    );
  },
);

function UserAvatar({ link }: { link: ResponseLink }) {
  const { user } = link;
  const { slug } = useWorkspace();

  return (
    <Tooltip
      content={
        <div className="w-full p-3">
          <Avatar user={user} className="h-8 w-8" />
          <div className="mt-2 flex items-center gap-1.5">
            <p className="text-sm font-semibold text-neutral-700">
              {user?.name || user?.email || "Anonymous User"}
            </p>
            {!slug && // this is only shown in admin mode (where there's no slug)
              user?.email && (
                <CopyButton
                  value={user.email}
                  icon={Mail}
                  className="[&>*]:h-3 [&>*]:w-3"
                />
              )}
          </div>
          <div className="flex flex-col gap-1 text-xs text-neutral-500">
            {user?.name && user.email && <p>{user.email}</p>}
          </div>
        </div>
      }
      delayDuration={150}
    >
      <div>
        <Avatar user={user} className="size-4" />
      </div>
    </Tooltip>
  );
}
