import React, { useEffect, useState } from "react";

import { Container, Grid } from "@material-ui/core";
/*import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

<Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
        <CircularProgress color="inherit" />
      </Backdrop>
*/
import useElementWidth from "../hooks/useElementWidth";
import Url from "../lib/urlparser.js";
import { useCampaignConfig } from "../hooks/useConfig";
import useData from "../hooks/useData";
import { makeStyles } from "@material-ui/core/styles";

import { Button, Snackbar } from "@material-ui/core";
import TextField from "./TextField";
import Alert from "@material-ui/lab/Alert";

import SendIcon from "@material-ui/icons/Send";
import DoneIcon from "@material-ui/icons/Done";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Consent from "./Consent";

import Organisation from "./Organisation";
import Country from "./Country";

import { addActionContact } from "../lib/server.js";
import uuid from "../lib/uuid.js";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0),
    width: "100%"
  },
  "#petition-form": { position: "relative" },
  "@global": {
    "select:-moz-focusring": {
      color: "transparent",
      textShadow: "0 0 0 #000"
    },
    "input:invalid + fieldset": {
    }
  }
}));

export default function Register(props) {
  const classes = useStyles();
  const config = useCampaignConfig();
  const [data, setData] = useData();
  //  const setConfig = useCallback((d) => _setConfig(d), [_setConfig]);

  const { t } = useTranslation();

  const width = useElementWidth("#proca-register");
  const [compact, setCompact] = useState(true);
  if ((compact && width > 450) || (!compact && width <= 450))
    setCompact(width <= 450);

  const [status, setStatus] = useState("default");
  const form = useForm({
    //    mode: "onBlur",
    //    nativeValidation: true,
    defaultValues: data
  });
  const {
    trigger,
    handleSubmit,
    setError,
    formState
  } = form;
  //  const { register, handleSubmit, setValue, errors } = useForm({ mode: 'onBlur', defaultValues: defaultValues });
  //const values = getValues() || {};
  const onSubmit = async data => {
    data.tracking = Url.utm();
    const result = await addActionContact(
      config.actionType || "register",
      config.actionPage,
      data
    );
    if (result.errors) {
      result.errors.forEach(error => {
        console.log(error);
      });
      setStatus("error");
      return;
    }
    setStatus("success");
    setData(data);
    uuid(result.addAction); // set the global uuid as signature's fingerprint
    props.done && props.done({
      errors: result.errors,
      uuid: uuid(),
      firstname: data.firstname,
      country: data.country
    });
  };

  const handleClick = async event => {
    const result= await trigger();
    if (result) {
      handleSubmit(onSubmit);
      props.onClick();
//      props.done();
    }
  }

  useEffect(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    //    register({ name: "country" });
    // todo: workaround until the feature is native react-form ?
    inputs.forEach(input => {
      input.oninvalid = e => {
        setError(
          e.target.attributes.name.nodeValue,
          e.type,
          e.target.validationMessage
        );
      };
    });
  }, [setError]);

  function Error(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="error">
            Sorry, we couldn't save your signature!
            <br />
            The techies have been informed.
          </Alert>
        </Snackbar>
      );
    return null;
  }

  function Success(props) {
    if (props.display)
      return (
        <Snackbar open={true} autoHideDuration={6000}>
          <Alert severity="success">Done, Thank you for your support!</Alert>
        </Snackbar>
      );
    return null;
  }

  if (status === "success") {
    return (
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <DoneIcon color="action" fontSize="large" my={4} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  return (
    <form
      className={classes.container}
      id="proca-register"
      onSubmit={handleSubmit(onSubmit)}
      method="post"
      url="http://localhost"
    >
      <Success display={status === "success"} />
      <Error display={status === "error"} />
      <Container component="main" maxWidth="sm">
        <Grid container spacing={1}>
          {config.component?.register?.field.organisation && (
            <Organisation form={form} compact={compact} />
          )}
          <Grid item xs={12} sm={compact ? 12 : 6}>
            <TextField
              form={form}
              name="firstname"
              label={t("First name")}
              placeholder="eg. Leonardo"
              autoComplete="given-name"
              required
            />
          </Grid>
          <Grid item xs={12} sm={compact ? 12 : 6}>
            <TextField
              form={form}
              name="lastname"
              label={t("Last name")}
              autoComplete="family-name"
              placeholder="eg. Da Vinci"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              form={form}
              name="email"
              type="email"
              label={t("Email")}
              autoComplete="email"
              placeholder="your.email@example.org"
              required
            />
          </Grid>
          {config.component?.register?.field?.postcode !== false && (
            <Grid item xs={12} sm={compact ? 12 : 3}>
              <TextField
                form={form}
                name="postcode"
                label={t("Postal Code")}
                autoComplete="postal-code"
                required={config.component?.register?.field?.postcode?.required}
              />
            </Grid>
          )}
          {config.component?.register?.field?.country !== false && (
            <Grid item xs={12} sm={compact ? 12 : 9}>
              <Country form={form} required />
            </Grid>
          )}
          {config.component?.register?.field?.phone === true && (
            <Grid item xs={12}>
              <TextField
                form={form}
                name="phone"
                label={t("Phone")}
              />
            </Grid>
          )}
          {config.component?.register?.field?.comment !== false && (
            <Grid item xs={12}>
              <TextField
                form={form}
                name="comment"
                multiline
                rowsMax="20"
                label={t("Comment")}
              />
            </Grid>
          )}
          <Consent
            organisation={props.organisation}
            privacy_url={config.privacyUrl}
            form={form}
          />

          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              onClick={props.onClick && handleClick}
              size="large"
              disabled={formState.isSubmitting}
              endIcon={<SendIcon />}
            >
              {" "}
              {props.buttonText || t("register")}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </form>
  );
}

