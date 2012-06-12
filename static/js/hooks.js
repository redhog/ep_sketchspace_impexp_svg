var padeditor = require('ep_etherpad-lite/static/js/pad_editor').padeditor;

exports.sketchSpaceDesigner_designer_DesignerUI_startup = function (hook_name, args, cb) {
  dojo.require("sketchSpaceDesigner.designer.bbox");
  dojo.require("dojox.gfx.utils");
  dojo.require("dojox.gfx.matrix");

  dojo.declare("ep_sketchspace_pdfbackground.DesignerUIMenuAddTools", [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templateString: '<ul>' +
                    '  <li id="exportSvg" dojoAttachPoint="exportSvgButton">' +
                    '    <a title="Export as SVG"><span class="buttonicon buttonicon-export-svg"></span></a>' +
                    '  </<li>' +
                    '</ul>',
    startup: function () {
      this.inherited(arguments);
      $(this.exportSvgButton).click(exports.doExport);
    }
  });

  args.ui.addTools.addChild(new ep_sketchspace_pdfbackground.DesignerUIMenuAddTools());

  cb();
}

exports.doExport = function () {
  dojo.require("dojox.xml.parser");

  var exportNode = function (node) {
    if (node.extType) {

    } else {
      var shape = $.extend({}, node.getShape());
      var stroke = node.getStroke();
      var fill = node.getFill();
      var transform = node.getTransform();
      if (!shape.type) {
        xmlnode = doc.createElement("g");
        shape.children.map(function (child) {
          xmlnode.appendChild(exportNode(child));
        });
      } else {
        xmlnode = doc.createElement(shape.type);
        if (shape.type == "path") {
          shape.d = shape.path;
          delete shape.path;
        }
        for (name in shape) {
          xmlnode.setAttribute(name, shape[name]);
        }
      }
    }
    if (stroke) {
      xmlnode.setAttribute("stroke", stroke.color.toCss());
      xmlnode.setAttribute("stroke-opacity", stroke.color.a);
      xmlnode.setAttribute("stroke-width", stroke.width);
      xmlnode.setAttribute("stroke-linecap", stroke.cap);
      xmlnode.setAttribute("stroke-linejoin", stroke.join);
      // What to do about stroke.style?
    } else {
      xmlnode.setAttribute("stroke-opacity", 0);
      xmlnode.setAttribute("stroke-width", 0);
    }
    if (fill) {
      xmlnode.setAttribute("fill", fill.toCss());
      xmlnode.setAttribute("fill-opacity", fill.a);
    } else {
      xmlnode.setAttribute("fill-opacity", 0);
    }
    if (transform) {
      var m = [transform.xx, transform.yx, transform.xy, transform.yy, transform.dx, transform.dy].join(" ")
      xmlnode.setAttribute("transform", "matrix(" + m + ")");
    }
    return xmlnode;
  }

  var doc = dojox.xml.parser.parse('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.1" />')


  sketchSpace.editorUi.editor.surface_transform.children.map(function (child) {
    doc.documentElement.appendChild(exportNode(child));
  });


  window.open("data:application/octet-stream," + escape(dojox.xml.parser.innerXML(doc)));

  return doc;
}
