import * as React from "react";

export function processWarning(s: string, add?: string): JSX.Element[] {
    let ret = s.charAt(0).toUpperCase() + s.slice(1);

    ret = ret.replace(/\\n/g, "\n")
        .replace(/\\t/g, " ")
        .replace(/\\\\/g, "\\")
        .replace(/\\"/g, '"');
    return ret.split("\n").map((item: any, key: any) => {
        return <span key={key}>{item}{add}<br/></span>;
    });
}
