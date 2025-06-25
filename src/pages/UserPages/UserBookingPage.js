import React, { useState } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from "@mui/material";

/* ----------------------------------
   COMMON: BookingSummary Component
---------------------------------- */
const BookingSummary = () => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Cozy Private Room for Rent Near Colombo City Center
        </Typography>
        <Typography variant="body2" color="text.secondary">
          3 Bedrooms • 2 Bathrooms • 1 Parking
        </Typography>

        <Box my={2}>
          <Typography variant="body2">
            <strong>Move In:</strong> March 12, 2025
            <br />
            <strong>Move Out:</strong> March 19, 2025
          </Typography>
        </Box>

        <Box my={1}>
          <Typography variant="body2">
            <strong>Price Details</strong>
          </Typography>
          <Typography variant="body2">Rs. 10,000 / Month</Typography>
          <Typography variant="body2">One-time service fee: Rs. 300.00</Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
            Total: Rs. 10,300.00
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

/* ----------------------------------
   COMMON: BookingLayout Component
   - Left side: children (the step's form/content)
   - Right side: <BookingSummary />
---------------------------------- */
const BookingLayout = ({ children }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        {children}
      </Grid>
      <Grid item xs={12} md={4}>
        <BookingSummary />
      </Grid>
    </Grid>
  );
};

/* -------------------------------
   STEP 1: Booking Overview
------------------------------- */
const BookingOverview = () => {
  return (
    <BookingLayout>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Next Steps – Payment Procedure
          </Typography>
          <Typography variant="body2" paragraph>
            1. The landlord will respond within 72 hours.
            <br />
            2. No charges will be made until your request is accepted.
            <br />
            3. Once accepted, the place is yours!
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>On Move In:</strong>
            <br />
            • You have 24 hours to report any issues with the accommodation.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>On Move Out:</strong>
            <br />
            • If the property is in good condition, the landlord may return your security deposit.
          </Typography>
        </CardContent>
      </Card>
    </BookingLayout>
  );
};

/* -------------------------------
   STEP 2: Personal Details
------------------------------- */
const PersonalDetails = () => {
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [occupation, setOccupation] = useState("");
  const [field, setField] = useState("");
  const [destination, setDestination] = useState("");
  const [relocationDetails, setRelocationDetails] = useState("");

  return (
    <BookingLayout>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Details
          </Typography>

          {/* First & Last Name */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Contact Number & Email */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country Code"
                variant="outlined"
                fullWidth
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Number"
                variant="outlined"
                fullWidth
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          {/* Birthdate */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Birthdate"
              type="date"
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </Box>

          {/* Gender */}
          <Box sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ mb: 1, fontSize: 14 }}>
              Gender
            </FormLabel>
            <RadioGroup
              row
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel
                value="Female"
                control={<Radio />}
                label="Female"
              />
            </RadioGroup>
          </Box>

          {/* Nationality & Occupation */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nationality"
                variant="outlined"
                fullWidth
                placeholder="Select your country of origin"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation"
                variant="outlined"
                fullWidth
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Field & Destination */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Field"
                variant="outlined"
                fullWidth
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination University / Place of work (Optional)"
                variant="outlined"
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Relocation Details */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Relocation Details"
              placeholder="Why are you relocating? Will you be studying or working? Are you moving alone or with someone? If with others, who are they?"
              variant="outlined"
              multiline
              rows={3}
              fullWidth
              value={relocationDetails}
              onChange={(e) => setRelocationDetails(e.target.value)}
            />
          </Box>
        </CardContent>
      </Card>
    </BookingLayout>
  );
};

/* -------------------------------
   STEP 3: Payment
------------------------------- */
const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = () => {
    alert(`Payment successful for card: ${cardNumber}`);
  };

  return (
    <BookingLayout>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment
          </Typography>

          {/* Payment Method Selection */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Payment Method
            </Typography>
            <RadioGroup
              row
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="creditCard"
                control={<Radio />}
                label="Credit / Debit Card"
              />
              <FormControlLabel
                value="paypal"
                control={<Radio />}
                label="PayPal"
              />
            </RadioGroup>
          </Box>

          {/* Card Details (if creditCard is selected) */}
          {paymentMethod === "creditCard" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Card Number"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <TextField
                label="Name on Card"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Expiry Date (MM/YY)"
                    variant="outlined"
                    fullWidth
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="CVV"
                    variant="outlined"
                    fullWidth
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* PayPal Info (if PayPal is selected) */}
          {paymentMethod === "paypal" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                After clicking “Confirm & Pay,” you will be redirected to PayPal
                to complete your purchase securely.
              </Typography>
            </Box>
          )}

          {/* Payment Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handlePayment}
          >
            Confirm & Pay
          </Button>
        </CardContent>
      </Card>
    </BookingLayout>
  );
};

/* -------------------------------
   MAIN: UserBookingPage
------------------------------- */
const UserBookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = ["Booking Overview", "Personal Details", "Payment"];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BookingOverview />;
      case 1:
        return <PersonalDetails />;
      case 2:
        return <Payment />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      {/* Stepper (Roadmap) */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box>{getStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button onClick={handleNext} variant="contained" color="primary">
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Container>
  );
};

export default UserBookingPage;
