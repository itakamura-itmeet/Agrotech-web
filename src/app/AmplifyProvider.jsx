"use client";

import { Amplify } from "aws-amplify";
import { awsConfig } from "@/config/aws-config";

Amplify.configure(awsConfig);

export function AmplifyProvider({ children }) {
    return children;
}
