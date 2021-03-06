const fp = require("../src/index");
const Parser = require("../src/engines/dl/parser");
const fs = require("fs");
const compare = require("./playback").compare;

parser = new Parser();
describe("extractConnectionDetails", () => {
  test("hours and minutes provided", () => {
    const res = parser.extractConnectionDetails(
      "layover airport code AMS layover duration1h  25m"
    );

    expect(res).toEqual({ nextConnectionMinutes: 85, toCity: "AMS" });
  });

  test("only minutes provided", () => {
    res = parser.extractConnectionDetails(
      "layover airport code AMS layover duration 50m"
    );
    expect(res).toEqual({ nextConnectionMinutes: 50, toCity: "AMS" });
  });

  test("final destiation only (no connections)", () => {
    res = parser.extractConnectionDetails("arrival airport code JFK");
    expect(res).toEqual({ nextConnectionMinutes: undefined, toCity: "JFK" });
  });
});

describe("Run parse", () => {
  test("Parse BOS -> JFK (all non stop flights)", () => {
    id = "DL";
    query = {
      partners: true,
      cabin: "business",
      quantity: 1,
      fromCity: "BOS",
      toCity: "JFK",
      departDate: "2020-03-10",
      returnDate: "2020-03-10"
    };
    html = [
      {
        name: "results",
        path: "./test/__mock__/DL-BOS-JFK-2020-03-10-1580841057916.html"
      }
    ];
    const results = fp.Results.parse({
      engine: id,
      query: query,
      html: html
    });

    expect(results.ok).toBeTruthy();
    expect(results.error).toBeNull();

    res = results.trimContents().toJSON(true);

    let rawdata = fs.readFileSync(
      "test/__mock__/DL-BOS-JFK-2020-03-10-1580841057916.results.json"
    );
    let expected = JSON.parse(rawdata);
    compare(expected, results);
  });

  test("Multi-segment flights", () => {
    id = "DL";
    query = {
      partners: true,
      cabin: "business",
      quantity: 1,
      fromCity: "BOS",
      toCity: "JFK",
      departDate: "2020-03-10",
      returnDate: "2020-03-10"
    };
    html = [
      {
        name: "results",
        path: "./test/__mock__/DL-LHR-JFK-2020-03-10-1580757841916.html"
      }
    ];
    const results = fp.Results.parse({
      engine: id,
      query: query,
      html: html
    });

    expect(results.ok).toBeTruthy();
    expect(results.error).toBeNull();

    res = results.trimContents().toJSON(true);
    expect(res.flights.length).toBeGreaterThan(5);
  });

  test("Overnight flights", () => {
    id = "DL";
    query = {
      partners: true,
      cabin: "business",
      quantity: 1,
      fromCity: "BOS",
      toCity: "JFK",
      departDate: "2020-02-19",
      returnDate: "2020-02-19"
    };
    html = [
      {
        name: "results",
        path: "./test/__mock__/DL-CDG-JFK-2020-02-20-1580950167395.html"
      }
    ];
    const results = fp.Results.parse({
      engine: id,
      query: query,
      html: html
    });

    expect(results.ok).toBeTruthy();
    expect(results.error).toBeNull();

    res = results.trimContents().toJSON(true);
    expect(res.flights.length).toBeGreaterThan(5);
  });

  test("Parse SFO -> JFK", () => {
    id = "DL";
    query = {
      partners: true,
      cabin: "business",
      quantity: 1,
      fromCity: "BOS",
      toCity: "JFK",
      departDate: "2020-02-19",
      returnDate: "2020-02-19"
    };
    html = [
      {
        name: "results",
        path: "./test/__mock__/DL-SFO-JFK-2020-02-19-1580930198894.html"
      }
    ];
    const results = fp.Results.parse({
      engine: id,
      query: query,
      html: html
    });

    expect(results.ok).toBeTruthy();
    expect(results.error).toBeNull();

    res = results.trimContents().toJSON(true);
    expect(res.flights.length).toBeGreaterThan(10);
  });
});
