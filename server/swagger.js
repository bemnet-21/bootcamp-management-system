import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
        title: "Bootcamp Management System API",
        version: "1.0.0",
        description: "API documentation for the Bootcamp Management System",
    },
    servers: [
        {
            url: "http://localhost:5000",
            description: "Development server",
        }
    ]
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJSDoc(options);

export const swaggerDocs = (app, port) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
};

export { specs as swaggerSpecs, swaggerUi };