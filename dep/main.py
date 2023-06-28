"""
General purpose Discord bot
~~~~~~~~~~~~~~~~~~~

A general purpose Discord bot for VTubers, built with Pycord

:copyright: (c) 2022-present Mirage Aegis
:license: MIT, see LICENSE for more details.
"""
from os import listdir, getenv
import discord
from discord.ext import commands
from dotenv import load_dotenv


def main():
    load_dotenv()

    intents = discord.Intents().all()
    bot = commands.Bot(
        "@€$€rT¤",  # Funny prefix to effectively render text bot_commands unusable
        intents=intents,
        help_command=None,
        # debug_guilds=[getenv("DEV1"), getenv("DEV2")]  # Uncomment to test commands
    )

    for directory in listdir("./cogs"):
        for file in listdir(f"./cogs/{directory}"):
            if file.endswith(".py"):
                bot.load_extension(f"cogs.{directory}.{file[:-3]}")

    @bot.event
    async def on_ready():
        activity = discord.Game("Welcome to the world of sushis!")
        await bot.change_presence(activity=activity)

    bot.run(getenv("TOKEN"))


if __name__ == "__main__":
    main()
