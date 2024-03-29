import { http, HttpResponse, delay } from "msw";
import { nanoid } from "@reduxjs/toolkit";

import { getItems, saveItems } from "mocks/data";
import { merge } from "./utils";

let items = getItems();

const itemHandlers = [
  http.get("/api/v1/item", async () => {
    await delay();
    return HttpResponse.json(items);
  }),
  /*
  http.get('/api/v1/item/:id', ({ params: { id } }) => {
    const item = items.find(m => m.id === id);
    return item ? HttpResponse.json(item) : new HttpResponse(null, {
      status: 404,
      statusText: 'Item not found',
    });
  }),
  */
  // Upsert items: /api/v1/item?orderId=1
  http.put("/api/v1/item", async ({ request }) => {
    const url = new URL(request.url);

    const orderId = url.searchParams.get("orderId");
    const body = await request.json();
    if (!body || !orderId) {
      return new HttpResponse(null, {
        status: 400,
        statusText: "No data",
      });
    }
    // Remove extra fields and generate id if required and force orderId value
    const newItems = (Array.isArray(body) ? body : [body]).map(
      ({ id = nanoid(), name, ...rest }) => ({
        id,
        name,
        _orderId: orderId,
        ...rest,
      })
    );
    items = merge(items, newItems, (a, b) => a.id === b.id);
    saveItems(items);
    await delay();
    return HttpResponse.json(newItems);
  }),
  // POST `/api/v1/searchItems?orderId=1` to search by items by order
  // POST `/api/v1/searchItems` with itemIds array body to search by Id
  http.post("/api/v1/searchItems", async ({ request }) => {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");
    if (orderId) {
      const result = items.filter((i) => i._orderId === orderId);
      return HttpResponse.json(result);
    }

    const ids = (await request.json()) || [];
    const result = items.filter((i) => ids.includes(i.id));
    await delay();
    return HttpResponse.json(result);
  }),
  // DELETE `/api/v1/item?orderId=1` to delete all order items
  // DELETE `/api/v1/item` with itemId(s) in body
  http.delete("/api/v1/item", async ({ request }) => {
    const url = new URL(request.url);

    const orderId = url.searchParams.get("orderId");
    let body = await request.text();
    if (!body && !orderId) {
      return new HttpResponse(null, {
        status: 400,
        statusText: "orderId param or itemIds required",
      });
    }

    const originalCount = items.length;
    if (orderId) {
      // Delete by orderID
      items = items.filter((i) => i._orderId !== orderId);
    } else {
      // Delete by itemIds
      body = JSON.parse(body);
      const idsToDelete = Array.isArray(body) ? body : [body];
      items = items.filter((i) => !idsToDelete.some((id) => id === i.id));
    }

    saveItems(items);
    await delay();
    return HttpResponse.json({ deleteCount: originalCount - items.length });
  }),
];

export default itemHandlers;
