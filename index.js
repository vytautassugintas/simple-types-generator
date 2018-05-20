const api = require("./api-data.json");
var fs = require('fs');
const { 
  isPrimitiveType,
  extractLongName,
  createTypeDefinition,
  createListTypeDefinition,
  removeTrailingComa,
  createEnum,
  createType,
  createEnumContent
} = require("./helpers");

let tsContent = "";
let traversedTypes = [];

//TODO: fetch api and use async await here
const apiToGenerateTypesFor = api.find(item => item.name === "LendingMortgage");

function traverseResponseParams(params, typesFor) {
  let types = "";
  params.forEach(item => {
    if (item.isEnum) {
      // If its enum it will always contain listType which is actualy enum type - to fix needs changes in TDE
      const enumType = extractLongName(item.listType);
      types = types + `\n    ${item.simpleName}: ${enumType},`
      tsContent = tsContent + createEnum(enumType, createEnumContent(item.enumList));
    } else if(item.listType) {
      // @TODO: Potential problem: type properties doesn't come back, but list type exists
      types = types + createListTypeDefinition(item);
    } else {
      types = types + createTypeDefinition(item);
    }
    
    if (item.properties.length) {
      item.listType !== "" 
        ? traverseResponseParams(item.properties, extractLongName(item.listType))
        : traverseResponseParams(item.properties, item.simpleType);
    }
  })
  
  if (!traversedTypes.find(t => t === typesFor)){
    if(!isPrimitiveType(typesFor)) {
      traversedTypes.push(typesFor);
    }
    tsContent = tsContent + createType(typesFor, types);
  }
}

function writeToFile(content){
  fs.writeFile(__dirname + "/index.d.ts", content, err => {
    if(err) {
        return console.log(err);
    }
    console.log(`Generated types for ${apiToGenerateTypesFor.name}`);
  }); 
}

function generateFunctionDefinitions(service){
  let functionDefinitions = "";
  service.services.forEach(s => {
      functionDefinitions = s.responseParams.length 
        ? functionDefinitions.concat(`export function ${s.name}(): Promise<${s.name}Response>;\n`)
        : functionDefinitions.concat(`export function ${s.name}(): Promise<any>;\n`);
  });
  return functionDefinitions.concat("\n");
};

function generateTypeDefinitionsAndWriteToFile(api, definitions){
  let contentToWrite = definitions.concat(generateFunctionDefinitions(api));

  api.services.forEach(service => {
    if (service.responseParams.length){
      // TODO: this fn uses global variable - tsContent, refactor to return content as string
      traverseResponseParams(service.responseParams, service.name + 'Response');
    }
  });
  
  writeToFile(contentToWrite.concat(tsContent));
}

generateTypeDefinitionsAndWriteToFile(apiToGenerateTypesFor, "");