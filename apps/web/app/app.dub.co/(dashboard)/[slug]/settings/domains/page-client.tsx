"use client";

import useDomains from "@/lib/swr/use-domains";
import useDomainsCount from "@/lib/swr/use-domains-count";
import useWorkspace from "@/lib/swr/use-workspace";
import DomainCard from "@/ui/domains/domain-card";
import DomainCardPlaceholder from "@/ui/domains/domain-card-placeholder";
import { useAddEditDomainModal } from "@/ui/modals/add-edit-domain-modal";
import EmptyState from "@/ui/shared/empty-state";
import { SearchBoxPersisted } from "@/ui/shared/search-box";
import { PaginationControls } from "@dub/blocks/src/pagination-controls";
import { Globe, usePagination, useRouterStuff } from "@dub/ui";
import { ToggleGroup } from "@dub/ui/src/toggle-group";
import { InfoTooltip, TooltipContent } from "@dub/ui/src/tooltip";
import { DefaultDomains } from "./default-domains";

export default function WorkspaceDomainsClient() {
  const { id: workspaceId } = useWorkspace();

  const { AddEditDomainModal, AddDomainButton } = useAddEditDomainModal({
    buttonProps: {
      className: "h-9 rounded-lg",
    },
  });

  const { searchParams, queryParams } = useRouterStuff();
  const archived = searchParams.get("archived");
  const search = searchParams.get("search");

  const { allWorkspaceDomains, loading } = useDomains({ includeParams: true });
  const { data: domainsCount } = useDomainsCount();

  const { pagination, setPagination } = usePagination(50);

  return (
    <>
      <div className="grid gap-5">
        <div className="flex flex-wrap justify-between gap-6">
          <div className="flex items-center gap-x-2">
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Domains
            </h1>
            <InfoTooltip
              content={
                <TooltipContent
                  title="Learn more about how to add, configure, and verify custom domains on Dub."
                  href="https://dub.co/help/article/how-to-add-custom-domain"
                  target="_blank"
                  cta="Learn more"
                />
              }
            />
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="w-full sm:w-auto">
              <SearchBoxPersisted
                loading={loading}
                onChangeDebounced={(t) => {
                  if (t) {
                    queryParams({ set: { search: t }, del: "page" });
                  } else {
                    queryParams({ del: "search" });
                  }
                }}
              />
            </div>
            <ToggleGroup
              options={[
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
              selected={archived ? "archived" : "active"}
              selectAction={(id) =>
                id === "active"
                  ? queryParams({ del: ["archived", "page"] })
                  : queryParams({ set: { archived: "true" }, del: "page" })
              }
            />
            <AddDomainButton />
          </div>
        </div>
        {workspaceId && <AddEditDomainModal />}
        <div key={archived} className="animate-fade-in">
          {!loading ? (
            allWorkspaceDomains.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3">
                {allWorkspaceDomains.map((domain) => (
                  <li key={domain.slug}>
                    <DomainCard props={domain} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 py-10">
                <EmptyState
                  icon={Globe}
                  title={
                    archived
                      ? "No archived domains found for this workspace"
                      : search
                        ? "No custom domains found"
                        : "No custom domains found for this workspace"
                  }
                />
                <AddDomainButton />
              </div>
            )
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {Array.from({ length: 10 }).map((_, idx) => (
                <li key={idx}>
                  <DomainCardPlaceholder />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sticky bottom-0 rounded-b-[inherit] border-t border-gray-200 bg-white px-3.5 py-2">
          <PaginationControls
            pagination={pagination}
            setPagination={setPagination}
            totalCount={domainsCount || 0}
            unit={(p) => `domain${p ? "s" : ""}`}
          />
        </div>
      </div>

      <DefaultDomains />
    </>
  );
}
