// generate-look: the ONLY place an image-generation provider will ever be called.
// Not enabled yet. It exists to fix the contract before try-on / previews are built:
//   - the browser calls this function with the user's JWT (supabase.functions.invoke)
//   - the function reads the user's source photo with the RLS-scoped client
//   - the provider key comes from a Supabase secret (Deno.env), never from the app
//   - the result is written to "digital-you/<user id>/looks/<id>.jpg" and a saved_looks row,
//     so "Delete Digital You" removes it with everything else
// Docs: https://supabase.com/docs/guides/functions/auth
import { withSupabase } from "npm:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "user" }, (_req, _ctx) => {
    const providerKey = Deno.env.get("LOOK_PROVIDER_API_KEY");
    if (!providerKey) {
      return Promise.resolve(Response.json({ error: "Generated looks aren't enabled yet." }, { status: 501 }));
    }
    // Future: validate input, load ctx.supabase storage object, call provider, upload result under
    // `${ctx.userClaims!.id}/looks/`, insert saved_looks via ctx.supabase (RLS applies).
    return Promise.resolve(Response.json({ error: "Not implemented" }, { status: 501 }));
  }),
};
