const devmode = process.env.NODE_ENV === "development";
const envAsNumber = (name: string, defaultValue: number) =>
  parseInt(process.env[name.toUpperCase()] || "0") || defaultValue;

const dict = {
  dev: devmode,
  timeout: envAsNumber("FRIDA_TIMEOUT", 1000),
};

export default dict;
