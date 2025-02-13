/*
Copyright (c) 2018 Victor Ribeiro - victorqribeiro@gmail.com
Copyright (c) 2023 obfuscatedgenerated

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/obfuscatedgenerated/imgToAscii

*/

// No attempt has been made to refactor the code when forked, only to add small features.

module.exports = class imgToAscii {
	constructor(image, width, height, charType) {
		this.charType = charType || 0;
		this.alphabet = {
			0: ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "],
			1: ["$", "@", "B", "%", "8", "&", "W", "M", "#", "*", "o", "a", "h", "k", "b", "d", "p", "q", "w", "m", "Z", "O",
				"0", "Q", "L", "C", "J", "U", "Y", "X", "z", "c", "v", "u", "n", "x", "r", "j", "f", "t", "/", "\\", "|", "(",
				")", "1", "{", "}", "[", "]", "?", "-", "_", "+", "~", "\<", "\>", "i", "!", "l", "I", ";", ":", ",", "\"", "^",
				"`", "'", ".", " "]
		}
		this.ansi_colors = {
			reset: "\x1B[39m",
			black: "\x1B[30m",
			red: "\x1B[31m",
			green: "\x1B[32m",
			yellow: "\x1B[33m",
			blue: "\x1B[34m",
			magenta: "\x1B[35m",
			cyan: "\x1B[36m",
			white: "\x1B[37m",
			gray: "\x1B[90m"
		};
		this.ansi_to_rgb = {
			black: [0, 0, 0],
			red: [255, 0, 0],
			green: [0, 255, 0],
			yellow: [255, 255, 0],
			blue: [0, 0, 255],
			magenta: [255, 0, 255],
			cyan: [0, 255, 255],
			white: [255, 255, 255],
			gray: [127, 127, 127]
		};
		this.string = "";
		this.stringColor = "";
		this.stringANSIColor = "";
		this.stringANSI8BitColor = "";
		this.imageSrc = image;
		this.loadImage = new Promise((resolve, reject) => {
			this.image = new Image();
			this.image.src = this.imageSrc;
			this.image.crossOrigin = "Anonymous";
			this.image.onload = () => {
				this.canvas = document.createElement('canvas');
				this.canvas.width = width || this.image.width;
				this.canvas.height = height || this.image.height;
				this.context = this.canvas.getContext('2d');
				this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
				this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
				let grayStep = Math.ceil(255 / this.alphabet[this.charType].length);
				for (let i = 0; i < this.imageData.data.length; i += 4) {
					for (let j = 0; j < this.alphabet[this.charType].length; j++) {
						let r = this.imageData.data[i];
						let g = this.imageData.data[i + 1];
						let b = this.imageData.data[i + 2];
						if ((r * 0.2126) + (g * 0.7152) + (b * 0.0722) < (j + 1) * grayStep) {
							const char = this.alphabet[this.charType][j];
							this.string += char
							this.stringColor += "<span style=\"color: rgb(" + r + "," + g + "," + b + "); \">"
								+ (char.replace(' ', '&nbsp;'))
								+ "</span>";
							
							// get closest ansi color from dict
							let closest = "gray";
							let closestDistance = 1000000;

							for (let ansi_color in this.ansi_to_rgb) {
								let ansi_rgb = this.ansi_to_rgb[ansi_color];

								let distance = Math.sqrt(
									Math.pow(ansi_rgb[0] - r, 2) +
									Math.pow(ansi_rgb[1] - g, 2) +
									Math.pow(ansi_rgb[2] - b, 2)
								);

								if (distance < closestDistance) {
									closest = ansi_color;
									closestDistance = distance;
								}
							}

							this.stringANSIColor += this.ansi_colors[closest] + char + this.ansi_colors.reset;

							this.stringANSI8BitColor += "\x1B[38;2;" + r + ";" + g + ";" + b + "m" + char + "\x1B[39m";

							break;
						}
					}
					if (!((i / 4 + 1) % this.canvas.width)) {
						this.string += "\n";
						this.stringColor += "<br>";
						this.stringANSIColor += "\n";
						this.stringANSI8BitColor += "\n";
					}
				}
				resolve();
			};
			this.image.error = reject;
		}).catch(e => console.error(e));
	}

	getPreElement() {
		const pre = document.createElement('pre');
		pre.style.fontFamily = "Courier, monospace";
		pre.style.lineHeight = "6px";
		pre.style.fontSize = "11px";
		pre.style.display = "inline-block";
		return pre
	}

	async display(appendToBody = true) {
		const pre = this.getPreElement();
		if (appendToBody)
			document.body.appendChild(pre);
		await this.loadImage;
		pre.innerText = this.string;
		if (!appendToBody)
			return pre
	}

	async displayColor(bg, appendToBody = true) {
		const pre = this.getPreElement();
		pre.style.backgroundColor = bg;
		if (appendToBody)
			document.body.appendChild(pre);
		await this.loadImage;
		pre.innerHTML = this.stringColor;
		if (!appendToBody)
			return pre
	}

}
