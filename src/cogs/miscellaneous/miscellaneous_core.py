"""
Core miscellaneous commands
~~~~~~~~~~~~~~~~~~~

The basic miscellaneous commands of the bot. This module should only be loaded as a cog

:copyright: (c) 2022-present Mirage Aegis
:license: MIT, see LICENSE for more details.
"""
import discord
from discord.ext import commands
import datetime


class MiscellaneousCore(commands.Cog):

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.start = datetime.datetime.utcnow()

    @commands.slash_command(description="Get the bot's response time")
    async def ping(self, ctx: discord.ApplicationContext):
        await ctx.send_response(f":ping_pong: {round(self.bot.latency * 1000)} ms")

    @commands.slash_command(description="View the current statistics of the bot")
    async def stats(self, ctx: discord.ApplicationContext):
        """
        Displays the current stats of the bot in a rich embed.
        The stats include the bot's current uptime, amount of servers it's in,
        the date it was created, and its current version.
        """
        uptime = (datetime.datetime.utcnow() - self.start).total_seconds()
        disptime = f"{int(uptime // 3600)} hour(s), " \
                   f"{int((uptime % 3600) // 60)} minute(s), {int((uptime % 3600) % 60)} second(s)"

        embed = discord.Embed(
            title='Bot status',
            colour=discord.Colour.blue()
        )
        embed.set_author(name='Sushi Bot',
                         icon_url='https://cdn.discordapp.com/attachments/775125652504313857/795419478744891422'
                                  '/OkFinalSushiBotPfpHere.jpg'
        )
        embed.add_field(name='Bot created', value='2020-11-08', inline=False)
        embed.add_field(name='Up time', value=disptime, inline=False)
        embed.add_field(name='Developers', value='<@123456133368119296>\nFeel free to leave suggestions and report bugs to us.',
                        inline=False)
        embed.add_field(name='Version', value='2.0.0-Beta', inline=False)
        embed.set_footer(text='Bot is hosted.')

        await ctx.send_response(embed=embed)


def setup(bot: commands.Bot):
    bot.add_cog(MiscellaneousCore(bot))
