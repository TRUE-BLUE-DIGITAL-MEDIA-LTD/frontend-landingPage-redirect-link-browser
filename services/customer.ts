import axios from "axios";

export async function CreateCustomer({
  landingPageId,
  data,
}: {
  data: any;
  landingPageId: string;
}) {
  try {
    const res = await axios.post(
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "http://localhost:3001/v1/customers"
        : "https://backend-landingpage-admin-dasboard-n2vkrqhb2a-uc.a.run.app/v1/customers",
      {
        ...data,
        landingPageId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(err);
    throw err.response.data;
  }
}
