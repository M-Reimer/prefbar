/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Preferences Toolbar 4.
 *
 * The Initial Developer of the Original Code is Manuel Reimer.
 *
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Aaron Andersen <aaron@xulplanet.com>
 *                 Kevin Teuscher
 *                 Manuel Reimer <Manuel.Reimer@gmx.de>
 *                 Stephen Clavering <mozilla@clav.me.uk>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// +-
// |  the contents of this file will be loaded into the framescript sandboxes
// +-

//
// "Kill Flash" button
//

function prefbarKillFlash() {
  var frames = prefbarGetFrames(content.window);

  for (var frameindex = 0; frameindex < frames.length; frameindex++) {
    var page = frames[frameindex].document;

    // "Twice-Cooked Method" and <embed>

    var embeds = page.getElementsByTagName("embed");

    for(var i = embeds.length - 1; i >= 0; i--) {
      var current = embeds[i];

      if(current.type =="application/x-shockwave-flash") {
        if(current.parentNode.nodeName.toLowerCase() == "object")
          current = current.parentNode;
        prefbarRemoveElement(page, current);
      }
    }

    // "Satay Method" and <object>

    var objects = page.getElementsByTagName("object");

    for(var i = objects.length - 1; i >= 0; i--) {
      var current = objects[i];

      if(current.type =="application/x-shockwave-flash")
        prefbarRemoveElement(page, current);
    }
  }
}

function prefbarGetFrames(owindow) {
  var winarray = new Array();
  winarray.push(owindow);
  for (var index = 0; index < owindow.frames.length; index++)
    winarray = winarray.concat(prefbarGetFrames(owindow.frames[index]));
  return winarray;
}

function prefbarRemoveElement(page, element) {
  var width = element.width;
  var height = element.height;
  if (width && height) {
    var div = page.createElement("DIV");
    var text = page.createTextNode(" ");
    div.appendChild(text);

    element.parentNode.replaceChild(div, element);

    div.setAttribute("style", "height: " + height + "px; width: " + width + "px; border: 1px solid black;");
  }
  else
    element.parentNode.removeChild(element);
}
