import Admin from "../model/admin.model.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError } from "../utils/ApiErrors.js";

// Load environment variables from .env file
dotenv.config();

export const generateAccessAndRefreshTokensUsers = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};
export const generateAccessAndRefreshTokensAdmin = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    console.log('user>>>>',user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log('accessToken>>>>',accessToken,'refreshToken>>>',refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};

export const generateOTP = () => {
  // Generate a random 6-digit OTP
  return crypto.randomInt(100000, 999999);
};

export const calculateDaysSince = (createdAt) => {
  const today = new Date(); // Get today's date
  const createdDate = new Date(createdAt); // Convert createdAt to a Date object

  // Calculate the difference in time
  const timeDifference = today - createdDate;

  // Convert time difference from milliseconds to days
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  return Math.floor(daysDifference); // Return the integer part of the difference
}

export const generatePermissionToken = (tokenPayload) => {
  return jwt.sign(tokenPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
};
export const getSbu = (value) => {
  // Generate a random 6-digit OTP
  let parts = value.split(' ');
  let number = parts[1];

  // Pad the number to ensure it is at least 2 digits long
  let sbuCode = parts[0] + number.padStart(2, '0');

  return sbuCode;
};
export const encryptToken = (input) => {
  let jsonString = JSON.stringify(input);

  let output = '';
  let shift = 4;
  for (let i = 0; i < jsonString.length; i++) {
    let charCode = jsonString.charCodeAt(i);
    output += String.fromCharCode(charCode + shift); // Shift the character code
  }
  return output;
};

export const getRelatedEmails = (email) => {
  // const emailMapping = {
  //   'efl.fg.sonipat@parnamigroup-logistics.com': [
  //     'chandra.pal@eurekaforbes.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],
  //   'in_tpl_eflhyd@fmlogistic.com ': [
  //     'srinivasrao.b@eurekaforbes.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],
  //   'manjunath.v@rpmgroupindia.com': [
  //     'manjunath.v@rpmgroupindia.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],
  //   'eflchennai@20cube.com': [
  //     'harikrishnan.n@eurekaforbes.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],
  //   'Sandip.Dattagupta@tvsscs.com': [
  //     'amit.goswami@eurekaforbes.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],
  //   'shakir.ansari@rpmgroupindia.com': [
  //     'mayur.yadav@eurekaforbes.com',
  //     'efl.report@rpmgroupindia.com',
  //   ],

  //   // Add more mappings here if needed
  // };

  const emailMapping = {
    'efl.fg.sonipat@gmail.com': [
      'chandra.pal@eurekaforbes.com',
      'efl.report@rpmgroupindia.com',
    ],
    'in_tpl_eflhyd@gmail.com': [
      'srinivasrao.b@gmail.com',
      'efl.report@gmail.com',
    ],
    'manjunath.v@gmail.com': [
      'manjunath.v@gmail.com',
      'efl.report@gmail.com',
    ],
    'eflchennai@gmail.com': [
      'harikrishnan.n@gmail.com',
      'efl.report@gmail.com',
    ],
    'sandip.dattagupta@gmail.com': [
      'amit.goswami@gmail.com',
      'efl.report@gmail.com',
    ],
    'shakir.ansari@gmail.com': [
      'mayur.yadav@gmail.com',
      'efl.report@gmail.com',
    ],

    // Add more mappings here if needed
  };

  return emailMapping[email] || [];
}

export const getFormatDate = (dateString) => {
  const date = new Date(dateString);

  // Define an array of month abbreviations
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Get the month, day, and year
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Return the formatted date string
  return `${month} ${day}, ${year}`;

};

export const getFormatDateTime = (dateString) => {
  // Check if the dateString is valid
  const date = new Date(dateString);
  if (isNaN(date)) {
    return "";
  }

  // Define an array of month abbreviations
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  // Get the month, day, year, hours, minutes, and seconds
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the hours, minutes, and seconds to always be two digits (e.g., 09:05)
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  // Return the formatted date and time string
  return `${month} ${day}, ${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

export const getColorForValue = (data) => {
  // Extract value from data or default to "0%"
  const thisWeekStr = data?.summaryOverview?.totalRequestsRaised?.thisWeek || "0%";

  // Parse the value and remove the '%' sign
  const thisWeekValue = parseFloat(thisWeekStr.replace('%', ''));

  // Determine the color based on the value
  if (thisWeekValue > 0) {
    return "#c62828"; // Red for positive values
  } else if (thisWeekValue < 0) {
    return "#2e7d32"; // Green for negative values
  } else {
    return "#9e9e9e"; // Gray for neutral (0%)
  }
}

export const getWeeklyReportSubject = () => {
   const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

  // Get last week's Saturday (if today is Sunday, it's yesterday)
  const lastSaturday = new Date(today);
  const daysSinceSaturday = dayOfWeek === 0 ? 1 : dayOfWeek + 1;
  lastSaturday.setDate(today.getDate() - daysSinceSaturday);

  // Get corresponding Monday (6 days before Saturday)
  const lastMonday = new Date(lastSaturday);
  lastMonday.setDate(lastSaturday.getDate() - 5);

  // Format date to "dd MMM yyyy"
  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ISO Week Number Calculation
  function getISOWeekNumber(date) {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((tempDate - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
      )
    );
  }

  const weekNumber = getISOWeekNumber(lastMonday);
  const formattedMonday = formatDate(lastMonday);
  const formattedSaturday = formatDate(lastSaturday);

  return `Weekly Report: Serial Number Sync Summary – Week Number: ${weekNumber} (${formattedMonday} to ${formattedSaturday})`;
}