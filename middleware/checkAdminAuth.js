import { ApiError } from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";

export const verifyJWT = () => {
    return async (req, res, next) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await Admin.findById(decodedToken?._id).select("-password -refreshToken");

            if (!user) {
                return res.status(401).json(new ApiError(401, "Invalid Access Token"));
            }

            req.user = user;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json(new ApiError(401, "Access Token has expired"));
            }

            return res.status(401).json(new ApiError(401, "Invalid Access Token"));
        }
    };
};

