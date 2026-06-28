package main

import (
    "log"

    "github.com/gofiber/fiber/v3"
		"github.com/gofiber/template/html/v3"
		"github.com/gofiber/fiber/v3/middleware/static"
)

func main() {
		engine := html.New("./views", ".html")

		app := fiber.New(fiber.Config{
				Views: engine,
		})

		app.Get("/*", static.New("./static"))

		app.Get("/", func(c fiber.Ctx) error {
				return c.Render("index", fiber.Map{
						"Title": "Welcome, And Your choices Are...",
				}, "layout/main")
		})

    log.Fatal(app.Listen(":3000"))
}
