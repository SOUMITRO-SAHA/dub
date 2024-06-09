import { Domain } from "@prisma/client";
import { afterAll, describe, expect, test } from "vitest";
import { randomId } from "../utils/helpers";
import { IntegrationHarness } from "../utils/integration";

const slug = randomId();

const domainRecord = {
  slug: `dubtest.${slug}.com`,
  target: `https://dubtest.${slug}.com/landing`,
  expiredUrl: `https://dubtest.${slug}.com/expired`,
  placeholder: `https://dubtest.${slug}.com/placeholder`,
  type: ["redirect", "rewrite"][Math.floor(Math.random() * 2)],
  noindex: true,
};

const expectedDomain = {
  id: expect.any(String),
  slug: domainRecord.slug,
  verified: false,
  primary: expect.any(Boolean),
  archived: false,
  noindex: domainRecord.noindex,
  placeholder: domainRecord.placeholder,
  expiredUrl: domainRecord.expiredUrl,
  target: domainRecord.target,
  type: domainRecord.type,
  clicks: 0,
};

describe.sequential("/domains/**", async () => {
  const h = new IntegrationHarness();
  const { workspace, http } = await h.init();

  afterAll(async () => {
    await h.deleteDomain(domainRecord.slug);
  });

  test("POST /domains", async () => {
    const { status, data: domain } = await http.post<Domain>({
      path: "/domains",
      query: { workspaceId: workspace.id },
      body: domainRecord,
    });

    expect(status).toEqual(201);
    expect(domain).toStrictEqual(expectedDomain);
  });

  test("GET /domains/{slug}", async () => {
    const { status, data: domain } = await http.get<Domain>({
      path: `/domains/${domainRecord.slug}`,
      query: { workspaceId: workspace.id },
    });

    expect(status).toEqual(200);
    expect(domain).toStrictEqual({
      ...expectedDomain,
      url: domainRecord.target,
    });
  });

  test("GET /domains", async () => {
    const { status, data: domains } = await http.get<Domain[]>({
      path: "/domains",
      query: { workspaceId: workspace.id },
    });

    expect(status).toEqual(200);
    expect(domains).toContainEqual(expectedDomain);
  });

  test("PATCH /domains/{slug}", async () => {
    const toUpdate = {
      target: `https://dubtest.${slug}.com/landing-new`,
      expiredUrl: `https://dubtest.${slug}.com/expired-new`,
      placeholder: `https://dubtest.${slug}.com/placeholder-new`,
      type: "rewrite",
      noindex: false,
      archived: true,
    };

    const { status, data: domain } = await http.patch<Domain>({
      path: `/domains/${domainRecord.slug}`,
      query: { workspaceId: workspace.id },
      body: toUpdate,
    });

    expect(status).toEqual(200);
    expect(domain).toStrictEqual({
      ...expectedDomain,
      ...toUpdate,
    });
  });
});
