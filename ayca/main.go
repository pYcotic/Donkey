package main

import (
    "log"

    "github.com/gofiber/fiber/v3"
		"github.com/gofiber/template/html/v3"
		"github.com/gofiber/fiber/v3/middleware/static"
)

func main() {
		app := fiber.New(fiber.Config{
				Views: html.New("./views", ".html"),
		})

		app.Get("/*", static.New("./static"))

		app.Get("/", func(c fiber.Ctx) error {
				return c.Render("index", fiber.Map{
						"Title": "Hello, World!",
				})
		})

    log.Fatal(app.Listen(":3000"))
}
