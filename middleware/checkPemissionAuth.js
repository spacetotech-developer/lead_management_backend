import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";

export const verifyPermissionToken = () => {
    return async (req, res, next) => {
        console.log("Verifying permission token...");
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Verifying permission token...",token);

        if (!token) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Verifying permission token...",decodedToken);
            if (!decodedToken.email) {
                return res.status(401).json(new ApiError(401, "Access Token has expired"));
        
            }


            req.user = decodedToken;
            next();
            console.log("Verifying permission token...????????????",);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json(new ApiError(401, "Access Token has expired"));
            }

            return res.status(401).json(new ApiError(401, "Invalid Access Token"));
        }
    };
};
