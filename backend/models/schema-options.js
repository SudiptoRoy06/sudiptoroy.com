const publicTransform = (_document, value) => {
  value.id = value._id.toString();
  delete value._id;
  delete value.__v;
  delete value.identity;
  return value;
};

export const schemaOptions = {
  versionKey: false,
  toJSON: { transform: publicTransform },
  toObject: { transform: publicTransform }
};
