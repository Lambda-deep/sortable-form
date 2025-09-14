import { type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    // Return a simple 204 No Content response for favicon requests
    return new Response(null, { status: 204 });
}
