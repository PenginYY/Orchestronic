import mongoose, { Schema } from "mongoose";

const resourceSchema = new Schema({
  userid: {
    type: String,
    ref: "User",
    required: true,
  },
  vmname: { type: String },
  vmsize: { type: String },
  region: { type: String },
  os: { type: String },
  type: { type: String },
  username: { type: String },
  password: { type: String },
  allocationip: { type: String },
  // publicipenabled: { type: Boolean },
  projectid: { type: String },
});

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
export default Resource;
