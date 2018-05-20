module.exports = {
  isPrimitiveType,
  extractLongName,
  createTypeDefinition,
  createListTypeDefinition,
  removeTrailingComa,
  createEnum,
  createType,
  createEnumContent
}

function isPrimitiveType(type) {
  return type === "string" || type === "number" || type === "boolean" || type === "array";
}

function extractLongName(namespacedTypeName){
  return namespacedTypeName.split(/[. ]+/).pop();
}

function createTypeDefinition(property){
  return `\n    ${property.simpleName}: ${property.simpleType},`;
}

function createListTypeDefinition(property){
  return `\n    ${property.simpleName}: ${extractLongName(property.listType)}[],`;
}

function removeTrailingComa(content){
  return content.slice(0,-1);
}

function createEnum(type, types){
  return `export enum ${type} { ${removeTrailingComa(types)} \n}\n\n`
}

function createType(type, types){
  return `export type ${type} = { ${removeTrailingComa(types)} \n}\n\n`
}

function createEnumContent(enumList) {
  enums = "";
  enumList.forEach(e => {
    enums = enums + `\n    ${e},`;
  })
  return enums;
}