//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Divider,
  TextField,
  InputAdornment,
  Backdrop
} from "@mui/material";
import { Link } from "@mui/icons-material";
import GoogleShareToClassRoom from "google-classroom-share";
import { toast } from "react-toastify";
import "../../../style/sharepopupStyles.css";
import useTranslations from "../../../hooks/useTranslations";
function SharePopup({ shareLink, close }) {
  const [open, setOpen] = useState(true);
  const [url, setUrl] = useState("");
  const [showPopupModal, setShowPopupModal] = useState(false);
  const translations = useTranslations();
  useEffect(
    () => {
      const script = document.createElement("script");
      script.src = "https://teams.microsoft.com/share/launcher.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    },
    [showPopupModal]
  );
  useEffect(() => {
    setUrl(shareLink);
  }, []);
  const shareLinkFunc = () => {
    var text = url;
    navigator.clipboard.writeText(text).then(
      function() {
        toast.success(translations.alerts.copiedinvitation);
      },
      function(err) {
        toast.error(err);
      }
    );
  };
  return (
    <Backdrop style={{ zIndex: "1" }} open onClick={close}>
      <div className="share__popup__main__div">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "10px",
            width: "100%"
          }}
        >
          <Typography variant="h4">{translations.sharepopup.title}</Typography>
        </div>
        <br />
        <Divider style={{ width: "100%" }} light />
        <br />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "10px",
            width: "100%"
          }}
        >
          <Typography variant="h6">{translations.sharepopup.sub}</Typography>
        </div>
        <div className="share__popup__icon__div">
          <GoogleShareToClassRoom
            body="Example Body"
            itemType="assignment"
            url={url}
            size={60}
            title="Join CONNECT!"
            onShare={type => console.log(`GoogleShareToClassRoom:${type}`)}
            onShareComplete={() =>
              console.log("GoogleShareToClassRoom:onShareComplete")
            }
            onShareStart={() =>
              console.log("GoogleShareToClassRoom:onShareStart")
            }
          />
          <div
            class="teams-share-button"
            data-href={url}
            data-button-type="small"
            data-icon-px-size="75"
            data-preview="true"
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: "10px",
            width: "100%"
          }}
        >
          <Typography variant="h6">{translations.sharepopup.sub2}</Typography>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row"
          }}
        >
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Link style={{ color: "c4c4c4", opacity: "90%" }} />
                </InputAdornment>
              )
            }}
            id="outlined-email-input"
            margin="normal"
            variant="outlined"
            aria-readonly="true"
            fullWidth
            value={url}
            style={{ width: "250px" }}
          />
          <Button
            onClick={() => {
              shareLinkFunc();
            }}
            variant="contained"
            color="primary"
            style={{
              marginTop: "8px",
              height: "50px",
              marginLeft: "10px",
              width: "100px"
            }}
          >
            {translations.sharepopup.button}
          </Button>
        </div>
      </div>
    </Backdrop>
  );
}
export default SharePopup;
