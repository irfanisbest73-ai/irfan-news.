console.log("IRFAN SERVER STARTING...");
const http = require("http");
const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

const parser = new Parser();

const PORT = process.env.PORT || 3000;

const feeds = {
  top: "https://feeds.feedburner.com/ndtvnews-top-stories",
  latest: "https://feeds.feedburner.com/ndtvnews-latest",
  india: "https://feeds.feedburner.com/ndtvnews-india-news"
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url.startsWith("/api/news")) {
    const category = new URL(req.url, `http://localhost:${PORT}`)
      .searchParams.get("category") || "top";

    const feedUrl = feeds[category];

    if (!feedUrl) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid category" }));
    }

    try {
      const feed = await parser.parseURL(feedUrl);

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });

      res.end(JSON.stringify({
        title: feed.title,
        items: feed.items.map(item => ({
          title: item.title,
          link: item.link,
          date: item.pubDate
        }))
      }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        error: "Unable to fetch NDTV news. Please try again later."
      }));
    }

    return;
  }

  const filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("File not found");
    }

    res.writeHead(200, {
      "Content-Type": filePath.endsWith(".html")
        ? "text/html"
        : "text/plain"
    });

    res.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`IRFAN NEWS running at http://localhost:${PORT}`);
});
