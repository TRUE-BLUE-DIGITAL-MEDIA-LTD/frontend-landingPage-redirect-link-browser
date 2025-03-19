import {
  GetLandingPageService,
  ResponseGetLandingPageService,
} from "@/services/landingPage";
import Head from "next/head";
import { useRouter } from "next/router";
import { GoogleAnalytics } from "nextjs-google-analytics";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { event } from "nextjs-google-analytics";
import { DirectLinkService } from "@/services/merchant";
import requestIp from "request-ip";
import { GetServerSideProps } from "next";
import { Language } from "../interfaces";
import * as crypto from "crypto";
import * as Bowser from "bowser"; // TypeScript
import PopupLayout from "../components/layouts/PopupLayout";
import InAppSpy from "inapp-spy";
import { FaChrome, FaSafari } from "react-icons/fa";
import { CreateCustomer } from "../services/customer";

function Index({
  landingPage,
  errorMessage,
  country,
}: {
  landingPage: ResponseGetLandingPageService;
  errorMessage?: string;
  country: string;
}) {
  const router = useRouter();
  const mainLink = landingPage?.mainButton;
  const [redirectLink, setRedirectLink] = useState<{
    url: string;
    os: "Android" | "iOS";
  } | null>(null);
  const { isInApp, appKey, appName } = InAppSpy();

  const preventDefaultForSubmitButtons = () => {
    // nornal submit button
    const anchorTags = document.querySelectorAll("a");
    anchorTags.forEach((button) => {
      let href = button.href;

      if (href === window.location.href) {
        href = mainLink;
      }
      button.addEventListener("click", function (e) {
        event("click", {
          category: "button-click",
          label: href,
        });

        if (landingPage.secondOffer) {
          event("click", {
            category: "secondOffer-offer",
            label: landingPage.secondOffer,
          });
          window.open(href, "_blank");
          router.push(landingPage.secondOffer);
        } else {
          router.push(href);
        }
        e.preventDefault();
      });
    });

    // form submit button

    const form = document.querySelector("form");

    // Add an event listener for the form submission
    form?.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent the default form submission

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      console.log("Form Data:", data); // Log the entire form data as an object
      event("click", {
        category: "button-click",
        label: mainLink,
      });

      const allData = Object.fromEntries(formData.entries());
      console.log("Form Data:", allData); // Log the entire form data as an object
      handleSumitEmail(allData);
    });
  };

  useEffect(() => {
    preventDefaultForSubmitButtons();
    const browser = Bowser.getParser(window.navigator.userAgent);
    if (browser.getOS().name === "iOS" && isInApp) {
      setRedirectLink(() => {
        return {
          url: `x-safari-https://${window.location.hostname}`,
          os: "iOS",
        };
      });
    }
    if (browser.getOS().name === "Android" && isInApp) {
      setRedirectLink(() => {
        return {
          url: `intent://${window.location.hostname}#Intent;scheme=https;end`,
          os: "Android",
        };
      });
    }
  }, []);

  const handleSumitEmail = async (data: {
    [k: string]: FormDataEntryValue;
  }) => {
    try {
      Swal.fire({
        title: "Thanks For Joining us",
        html: "Loading....",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await CreateCustomer({
        landingPageId: landingPage?.id,
        data,
      });
      Swal.fire({
        title: "Success",
        text: "You have been successfully registered",
        icon: "success",
      });

      if (landingPage.directLink) {
        const directLink = await DirectLinkService({
          email: data?.email as string,
          url: landingPage.directLink,
        });

        if (directLink.status === "rejected") {
          router.push(mainLink);
        } else if (directLink.value.status === "success") {
          router.push(directLink.value.location);
        }
      } else {
        window.open(mainLink, "_self");
      }
    } catch (err) {
      window.open(mainLink), "_self";
    }
  };
  if (errorMessage) {
    return (
      <div className="w-screen h-screen bg-black font-Anuphan">
        <div className="flex p-10 justify-center text-center  text-white items-center w-full h-full">
          <h1 className="text-base lg:text-3xl font-bold">{errorMessage}</h1>
        </div>
      </div>
    );
  }

  if (country === "Thailand") {
    return (
      <div
        className="w-screen h-screen bg-black font-semibold text-center
       font-Poppins text-white flex justify-center items-center text-lg md:text-2xl"
      >
        Our service is not available in your country.
      </div>
    );
  }
  if (!landingPage.id) {
    return (
      <div className="w-screen h-screen bg-black font-Anuphan">
        <div className="flex p-10 justify-center text-center  text-white items-center w-full h-full">
          <h1 className="text-base lg:text-3xl font-bold">
            This domain {landingPage.domain.name} has no landing page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      <GoogleAnalytics
        trackPageViews
        nonce={crypto.randomBytes(16).toString("base64")}
        gaMeasurementId={landingPage?.domain?.googleAnalyticsId}
      />

      <Head>
        <meta name="description" content={landingPage.description} />
        {/* facebook sharing link */}
        <meta property="og:title" content={landingPage.title} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={landingPage.description} />
        <meta property="og:image" content={landingPage.backgroundImage} />
        <meta property="og:url" content="https://bestDatingSite.com" />

        {/* tweeter sharing link */}
        <meta name="twitter:title" content={landingPage.title} />
        <meta name="twitter:type" content="website" />
        <meta name="twitter:description" content={landingPage.description} />
        <meta name="twitter:image" content={landingPage.backgroundImage} />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="shortcut icon" href={landingPage.icon} />
        <title>{landingPage.title}</title>
      </Head>
      {landingPage?.backOffer && (
        <button
          onClick={() => {
            event("click", {
              category: "backOffer-click",
              label: landingPage.backOffer,
            });
            router.push(landingPage.backOffer);
          }}
          className="fixed top-2 left-2 z-50 text-xl font-normal border border-white
       bg-red-500 rounded-md text-white px-8 py-4 hover:bg-red-50 hover:text-red-700 transition active:scale-105"
        >
          BACK
        </button>
      )}
      {redirectLink && (
        <PopupLayout onClose={() => setRedirectLink(null)}>
          <div className="w-80 h-max bg-white 50 p-2 gap-2 rounded-md flex flex-col">
            <h1 className="text-lg border-b">Default Browser Required</h1>
            {redirectLink.os === "Android" ? (
              <a
                className="w-full h-10 flex items-center justify-center gap-2 hover:bg-red-600 active:scale-105
              
              bg-red-500 text-white rounded-md "
                href={redirectLink.url}
                target="_blank"
              >
                <FaChrome /> Open Chrome
              </a>
            ) : (
              <a
                className="w-full h-10 flex items-center justify-center gap-2 hover:bg-red-600 active:scale-105
              
              bg-blue-500 text-white rounded-md "
                href={redirectLink.url}
                target="_blank"
              >
                <FaSafari />
                Open Safari
              </a>
            )}
          </div>
        </PopupLayout>
      )}
      <main dangerouslySetInnerHTML={{ __html: `${landingPage.html}` }} />
    </div>
  );
}

export default Index;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let host = ctx.req.headers.host;
  let country = "United States";
  try {
    const userIP = requestIp.getClientIp(ctx.req);
    const countryResponse = await fetch(`http://ip-api.com/json/${userIP}`);
    const response = await countryResponse?.json();
    if (response?.country) {
      country = response?.country;
    }
  } catch (error) {
    console.log("error", error);
  }

  if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
    host = "localhost:8181";
  } else {
    host = ctx.req.headers.host;
  }
  const acceptLanguage = ctx.req.headers["accept-language"];
  let userLanguage: Language = acceptLanguage
    ? (acceptLanguage.split(",")[0] as Language)
    : ("en" as Language);
  userLanguage = userLanguage?.split("-")[0] as Language;

  try {
    const landingPage = await GetLandingPageService({
      host,
      language: userLanguage,
    });
    return {
      props: {
        landingPage: landingPage,
        country,
      },
    };
  } catch (error) {
    return {
      props: {
        errorMessage: error.message,
      },
    };
  }
};
