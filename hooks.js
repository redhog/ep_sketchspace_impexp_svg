eejs = require("ep_etherpad-lite/node/eejs");

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_sketchspace_impexp_svg/templates/sketchSpaceStyles.ejs", {}, module);
  return cb();
}
