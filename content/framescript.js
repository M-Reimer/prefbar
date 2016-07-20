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
 * The Original Code is Preferences Toolbar 7.
 *
 * The Initial Developer of the Original Code is
 * Manuel Reimer.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Manuel Reimer <manuel.reimer@gmx.de>
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

// This is the PrefBar "frame script" and is needed for Mozilla e10s.
// The script is loaded *once* into the "content processes" and acts as a
// bridge between PrefBar button code and website content.

var context = this;

function handleMessageFromChrome(aMessage) {
  var principal = Components.classes["@mozilla.org/systemprincipal;1"]
    .createInstance(Components.interfaces.nsIPrincipal);
  var sandbox = new Components.utils.Sandbox(principal, {sandboxPrototype: context});

  // Load commands we provide for usage in frame scripts
  var oLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
    .getService(Components.interfaces.mozIJSSubScriptLoader);
  oLoader.loadSubScript("chrome://prefbar/content/framescriptCommands.js", sandbox);

  sandbox.argument = aMessage.data.argument;
  sandbox.caller = aMessage.data.caller;
  sandbox.reply = false;

  Components.utils.evalInSandbox(aMessage.data.code, sandbox, "1.8", "prefbar://" + aMessage.data.id.substr(15) + "/framescript");

  if (aMessage.objects.callback)
    aMessage.objects.callback(sandbox.reply);
}

addMessageListener("prefbar:call-button-framescript", handleMessageFromChrome);

addEventListener("click", function(event) {
  // Don't trust synthetic events
  if (!event.isTrusted) return true;

  var node = event.originalTarget;
  if (!node.getAttribute) return true;
  if (!node.hasAttribute("href")) return true;
  var tagname = node.nodeName.toLowerCase();
  var href = node.getAttribute("href");
  if (tagname == "a" && href.indexOf("prefbar://") == 0 && event.button < 2) {
    sendAsyncMessage("prefbar:trigger-url-import", {href: href}, {});
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
  return true;
}, false);
